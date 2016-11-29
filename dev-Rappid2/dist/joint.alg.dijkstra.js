/*! Rappid v2.0.0 - HTML5 Diagramming Framework

Copyright (c) 2015 client IO

 2016-09-20 


This Source Code Form is subject to the terms of the Rappid Academic License
, v. 1.0. If a copy of the Rappid License was not distributed with this
file, You can obtain one at http://jointjs.com/license/rappid_academic_v1.txt
 or from the Rappid archive as was distributed by client IO. See the LICENSE file.*/


// Dijkstra's shortest path algorithm.
// ===================================

// Implemented using a priority queue.
// Time complexity: O(|E| + |V| log |V|)

joint.alg = joint.alg || {};

// `adjacencyList` is an object where keys are nodes and values are
// lists of neighbours.
// `source` is the id of the source node from which shortest paths will be computed.
// `weight` is a function that returns a distance between two nodes.
joint.alg.Dijkstra = function(adjacencyList, source, weight) {

    weight = weight || function(u, v) { return 1; };

    var dist = {};
    dist[source] = 0;

    var previous = {};
    var Q = new joint.alg.PriorityQueue;

    for (var v in adjacencyList) {

        if (v !== source) {
            dist[v] = Infinity;
        }
        Q.insert(dist[v], v, v);
    }

    var u, neighbours, i, alt;
    var scanned = {};
    while (!Q.isEmpty()) {
        u = Q.remove();
        scanned[u] = true;
        neighbours = adjacencyList[u] || [];
        for (i = 0; i < neighbours.length; i++) {
            v = neighbours[i];
            if (!scanned[v]) {
                alt = dist[u] + weight(u, v);
                if (alt < dist[v]) {
                    dist[v] = alt;
                    previous[v] = u;
                    Q.updatePriority(v, alt);
                }
            }
        }
    }

    return previous;
};
