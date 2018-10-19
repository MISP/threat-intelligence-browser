import settings
import os
import redis
import json
from pprint import pprint
from collections import defaultdict
import networkx as nx

GROUP_GALAXY    = 'galaxy'
GROUP_CLUSTER   = 'cluster'

class Browser:
    def __init__(self):
        self.serv = redis.Redis(
            host=settings.host,
            port=settings.port,
            db=settings.db
        )
        self.Gc = nx.DiGraph()
        self.Gg = nx.DiGraph()

        self.clusters = {}
        self.clustersFastMappingUUIDtoName = {}
        self.clustersFastMappingValuetoUUID = {}

        self.galaxies = {}
        self.galaxiesFastMappingUUIDtoName = {}
        self.galaxiesFastMappingValuetoUUID = {}

        self.edges = defaultdict(list)

        self._loadJsons()
        self.clusterNames = list(self.clustersFastMappingValuetoUUID.keys())
        self.clusterNames = [{'name': name, 'uuid': uuid} for name, uuid in self.clustersFastMappingValuetoUUID.items()]
        self.galaxyNames = list(self.galaxiesFastMappingValuetoUUID.keys())
        self.galaxyNames = [{'name': name, 'uuid': uuid} for name, uuid in self.galaxiesFastMappingValuetoUUID.items()]

    def getGalaxyNames(self):
        return self.galaxyNames

    def lookup(self, value):
        return []

    def get(self, Id):
        ret = {
            'nodes': [],
            'links': []
        }
        galaxy = self.galaxies.get(Id, None)
        if galaxy is None:
            cluster = self.clusters.get(Id, {})
            cluster['group'] = GROUP_CLUSTER
            ret['nodes'].append(cluster)
        else:
            galaxy['group'] = GROUP_GALAXY
            if 'values' in galaxy and len(galaxy['values']) > 0:
                for cluster in galaxy['values']:
                    cluster['group'] = GROUP_CLUSTER
            ret['nodes'].append(galaxy)
        return ret

    # returns all nodes uuid and names along with edges
    def getAllGalaxies(self):
        nodes = self.galaxyNames
        for n in nodes:
            n['group'] = GROUP_GALAXY

        res = {
            'nodes': nodes,
            'links': []
            #'links': list(self.Gc.edges())[0:100]
        }
        return res

    def getClusters(self, galaxyId):
        res = {
            'nodes': [],
            'links': []
        }
        galaxy = self.galaxies.get(galaxyId, None)
        if galaxy is None:
            return res

        clusters = galaxy.get('values', [])
        for cluster in clusters:
            cluster['group'] = GROUP_CLUSTER
            res['nodes'].append(cluster)
            res['links'].append({
                'from': galaxyId,
                'to': cluster['uuid']
            })

        return res

    def _loadJsons(self):
        path = 'misp-galaxy/clusters/'
        files = []
        for filename in os.listdir(path):
            filepath = os.path.join(path, filename)
            if os.path.isfile(filepath) and filename.endswith('.json'):
                files.append(filepath)

        for jfile in files:
            with open(jfile, 'r') as f:
                jcontent = json.load(f)

                galaxy_name = jcontent['name']
                galaxy_uuid = jcontent.get('uuid', None)
                if galaxy_uuid is None or galaxy_uuid == '':
                    continue
                self.galaxies[galaxy_uuid] = jcontent
                self.galaxiesFastMappingUUIDtoName[galaxy_uuid] = galaxy_name
                self.galaxiesFastMappingValuetoUUID[galaxy_name] = galaxy_uuid

                for cluster in jcontent['values']:
                    cluster_value = cluster['value']
                    cluster_uuid = cluster.get('uuid', None)
                    if cluster_uuid is None or cluster_uuid == '':
                        continue
                    self.clusters[cluster_uuid] = cluster
                    self.clustersFastMappingUUIDtoName[cluster_uuid] = cluster_value
                    self.clustersFastMappingValuetoUUID[cluster_value] = cluster_uuid

                    self.Gc.add_node(cluster_uuid, **cluster)

                    # add related
                    if 'related' in cluster:
                        for related in cluster['related']:
                            rel_uuid = related['dest-uuid']
                            self.edges[cluster_uuid].append(rel_uuid)
                            self.Gc.add_edge(cluster_uuid, rel_uuid)

        #path = 'misp-galaxy/galaxies/'
        #files = []
        #for filename in os.listdir(path):
        #    filepath = os.path.join(path, filename)
        #    if os.path.isfile(filepath) and filename.endswith('.json'):
        #        files.append(filepath)

        #for jfile in files:
        #    with open(jfile, 'r') as f:
        #        galaxy = json.load(f)
        #        galaxy_name = galaxy['name']
        #        galaxy_uuid = galaxy.get('uuid', None)
        #        if galaxy_uuid is None or galaxy_uuid == '':
        #            continue
        #        self.galaxies[galaxy_uuid] = galaxy
        #        self.galaxiesFastMappingUUIDtoName[galaxy_uuid] = galaxy_name
        #        self.galaxiesFastMappingValuetoUUID[galaxy_name] = galaxy_uuid

        #        self.Gg.add_node(galaxy_uuid, **galaxy)
